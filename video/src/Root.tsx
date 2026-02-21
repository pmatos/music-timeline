import {Composition} from 'remotion';
import {Main} from './Main';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MusikerVideo"
				component={Main}
				durationInFrames={30 * 60}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
