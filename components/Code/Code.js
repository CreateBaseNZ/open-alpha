import { useEffect, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import useUnity from "/hooks/useUnity";

import Game from "./Game";
import Workspace from "./Workspace";

import { ConsoleContextProvider } from "../../store/console-context";

import classes from "./code.module.scss";

const Code = ({ setLoaded, mode, project, iteration, query, blockList }) => {
	const [unityContext, sensorData, gameState, resetScene] = useUnity({
		project: project.query,
		scenePrefix: project.scenePrefix,
		scene: mode.toLowerCase(),
		iteration: iteration,
		setLoaded: setLoaded,
	});

	useEffect(() => {
		return () => setLoaded(false);
	}, []);

	return (
		<div className={classes.code}>
			<ConsoleContextProvider>
				<div className={`${classes.mainWindow} ${project.stacked ? classes.stackedView : classes.shelvedView}`}>
					<Link
						href={{
							pathname: `/project/${project.query}/${iteration}/[step]`,
							query: { step: mode.toLowerCase() },
						}}>
						<button className={classes.backButton} title="Back to project">
							<span className="material-icons-outlined">exit_to_app</span>
						</button>
					</Link>
					<Game unityContext={unityContext} />
					<Workspace query={query} blockList={blockList} stacked={project.stacked} unityContext={unityContext} sensorData={sensorData} gameState={gameState} />
				</div>
			</ConsoleContextProvider>
		</div>
	);
};

export default Code;
