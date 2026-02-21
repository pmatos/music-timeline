import {AbsoluteFill} from 'remotion';

export const Main: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#1a1a2e',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<h1 style={{color: '#fff', fontFamily: 'sans-serif'}}>
				musiker.page
			</h1>
		</AbsoluteFill>
	);
};
