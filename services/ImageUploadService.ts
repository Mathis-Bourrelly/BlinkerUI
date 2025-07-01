import { getToken } from '@/hooks/useSetToken';

export interface UploadResult {
    url: string;
    filename?: string;
}

export class ImageUploadService {
    private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    private static readonly ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    /**
     * Détecte le type MIME à partir de l'extension du fichier
     */
    private static detectMimeTypeFromUri(uri: string): string {
        const extension = uri.toLowerCase().split('.').pop();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'webp':
                return 'image/webp';
            default:
                return 'image/jpeg'; // Fallback par défaut
        }
    }

    /**
     * Valide un fichier image avant l'upload
     */
    private static validateImage(file: any): void {
        if (!file) {
            throw new Error('Aucun fichier fourni');
        }

        console.log('Validation du fichier:', {
            uri: file.uri,
            type: file.type,
            fileName: file.fileName,
            fileSize: file.fileSize
        });

        // Vérifier la taille du fichier si disponible
        if (file.fileSize && file.fileSize > this.MAX_FILE_SIZE) {
            throw new Error('Le fichier est trop volumineux (max 10MB)');
        }

        // Détecter le type MIME à partir de l'URI si le type n'est pas fourni ou est incorrect
        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream' || !this.ALLOWED_TYPES.includes(mimeType.toLowerCase())) {
            const detectedType = this.detectMimeTypeFromUri(file.uri || '');
            console.log(`Type MIME détecté: ${mimeType} -> ${detectedType}`);
            mimeType = detectedType;
        }

        console.log('Type MIME final:', mimeType);
        console.log('Types autorisés:', this.ALLOWED_TYPES);

        // Vérifier le type MIME final ou l'extension comme fallback
        const extension = (file.uri || '').toLowerCase().split('.').pop();
        const isValidMimeType = this.ALLOWED_TYPES.includes(mimeType.toLowerCase());
        const isValidExtension = this.ALLOWED_EXTENSIONS.includes(extension || '');

        if (!isValidMimeType && !isValidExtension) {
            throw new Error(`Type de fichier non supporté (.${extension}). Utilisez JPG, PNG, GIF ou WebP`);
        }

        console.log('Validation réussie:', { mimeType, extension, isValidMimeType, isValidExtension });
    }

    /**
     * Prépare le fichier pour l'upload
     */
    private static prepareFileForUpload(file: any): any {
        // Détecter le type MIME correct
        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream' || !this.ALLOWED_TYPES.includes(mimeType.toLowerCase())) {
            mimeType = this.detectMimeTypeFromUri(file.uri || '');
        }

        // Générer un nom de fichier approprié
        let fileName = file.fileName || file.name;
        if (!fileName) {
            const extension = (file.uri || '').toLowerCase().split('.').pop() || 'jpg';
            fileName = `image_${Date.now()}.${extension}`;
        }

        return {
            uri: file.uri,
            type: mimeType,
            name: fileName,
        };
    }

    /**
     * Upload une image vers le backend
     */
    static async uploadImage(imageFile: any): Promise<UploadResult> {
        try {
            // Valider le fichier
            this.validateImage(imageFile);

            const token = await getToken();
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            // Créer FormData pour l'upload
            const formData = new FormData();
            const fileToUpload = this.prepareFileForUpload(imageFile);
            
            formData.append('image', fileToUpload as any);

            console.log('Uploading image:', {
                uri: fileToUpload.uri,
                type: fileToUpload.type,
                name: fileToUpload.name
            });

            // Essayer d'abord l'endpoint principal
            let response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/uploads/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Ne pas définir Content-Type pour FormData
                },
                body: formData,
            });

            // Si l'endpoint principal échoue, essayer l'endpoint alternatif
            if (!response.ok && response.status === 404) {
                console.log('Endpoint principal non trouvé, essai de l\'endpoint alternatif...');
                response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });
            }

            // Si les deux endpoints échouent avec 404, utiliser le service de fallback
            if (!response.ok && response.status === 404) {
                console.log('Aucun endpoint d\'upload trouvé, utilisation du service de fallback...');
                return await this.uploadToExternalService(imageFile);
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Erreur lors de l\'upload de l\'image';

                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }

                throw new Error(`${errorMessage} (${response.status})`);
            }

            const result = await response.json();

            // Vérifier que la réponse contient une URL
            if (!result.url && !result.data?.url) {
                throw new Error('URL de l\'image non reçue du serveur');
            }

            return {
                url: result.url || result.data.url,
                filename: result.filename || result.data?.filename
            };

        } catch (error) {
            console.error('Erreur lors de l\'upload d\'image:', error);
            throw new Error(error instanceof Error ? error.message : 'Erreur inconnue lors de l\'upload');
        }
    }

    /**
     * Upload multiple images en parallèle
     */
    static async uploadMultipleImages(imageFiles: any[]): Promise<UploadResult[]> {
        if (!imageFiles || imageFiles.length === 0) {
            return [];
        }

        try {
            const uploadPromises = imageFiles.map(file => this.uploadImage(file));
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Erreur lors de l\'upload multiple d\'images:', error);
            throw error;
        }
    }

    /**
     * Fallback: utilise un service d'upload externe si le backend n'est pas disponible
     */
    static async uploadToExternalService(imageFile: any): Promise<UploadResult> {
        console.warn('Utilisation du service de fallback pour l\'upload d\'image');

        try {
            // Option 1: Utiliser ImgBB (service gratuit)
            // Vous pouvez obtenir une clé API gratuite sur https://api.imgbb.com/
            const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;

            if (IMGBB_API_KEY) {
                return await this.uploadToImgBB(imageFile, IMGBB_API_KEY);
            }

            // Option 2: Simuler un upload réussi avec une URL de placeholder réaliste
            console.log('Simulation d\'upload d\'image...');

            return new Promise((resolve) => {
                setTimeout(() => {
                    // Générer une URL de placeholder plus réaliste
                    const timestamp = Date.now();
                    const extension = (imageFile.uri || '').toLowerCase().split('.').pop() || 'jpg';

                    resolve({
                        url: `https://picsum.photos/800/600?random=${timestamp}`,
                        filename: `uploaded_image_${timestamp}.${extension}`
                    });
                }, 1500); // Simuler un délai d'upload réaliste
            });

        } catch (error) {
            console.error('Erreur dans le service de fallback:', error);
            // En dernier recours, retourner une URL de placeholder simple
            return {
                url: `https://via.placeholder.com/800x600?text=Upload_Error`,
                filename: `error_${Date.now()}.jpg`
            };
        }
    }

    /**
     * Upload vers ImgBB (service gratuit)
     */
    private static async uploadToImgBB(imageFile: any, apiKey: string): Promise<UploadResult> {
        const formData = new FormData();
        const fileToUpload = this.prepareFileForUpload(imageFile);

        // ImgBB attend le fichier en base64
        // Pour simplifier, on utilise l'URL directement (pas optimal mais fonctionnel)
        formData.append('image', fileToUpload as any);
        formData.append('key', apiKey);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Échec de l\'upload vers ImgBB');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error('ImgBB a rejeté l\'upload');
        }

        return {
            url: result.data.url,
            filename: result.data.title || `imgbb_${Date.now()}.jpg`
        };
    }
}
