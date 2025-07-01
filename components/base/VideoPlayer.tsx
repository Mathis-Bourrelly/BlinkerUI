import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';
import {ThemedText} from "@/components/base/ThemedText";
import {useTheme} from "@/context/ThemeContext";

const videoSources = [
    { id: 1, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { id: 2, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { id: 3, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    { id: 4, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
];

// @ts-ignore
export default function VideoPlayer({ videoID }) {
    const { colors } = useTheme();

    const video = videoSources.find(v => v.id === Number(videoID));

    if (!video) {
        return <View><ThemedText variant={"Body"} color={colors.border}>Vidéo indisponible</ThemedText></View>;
    }

    const player = useVideoPlayer(video.url, player => {
        player.loop = true;
        player.play();
    });

    return (
        <View style={styles.contentContainer}>
            <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
        </View>
    );
}


const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    video: {
        width: 480,
        height: 270,
    },
});
