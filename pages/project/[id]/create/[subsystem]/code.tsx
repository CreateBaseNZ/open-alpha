import React, { ReactElement, useContext, useEffect, useRef, useState } from "react";
import { UnityContext } from "react-unity-webgl";
import * as Esprima from "esprima";
import * as Escodegen from "escodegen";
import useMixpanel from "../../../../../hooks/useMixpanel";
import ProjectLayout from "../../../../../components/Layouts/ProjectLayout/ProjectLayout";
import { ALL_PROJECTS_ARRAY, ALL_PROJECTS_OBJECT } from "../../../../../constants/projects";
import { TProject } from "../../../../../types/projects";
import classes from "../../../../../styles/code.module.scss";
import GlobalSessionContext from "../../../../../store/global-session-context";
import useApi from "../../../../../hooks/useApi";
// import Console from "../../../../../components/Project/Code/Console";
import Unity from "../../../../../components/Project/Code/Unity";
import Editor from "../../../../../components/Project/Code/Editor";
import useUnity from "../../../../../hooks/useUnity";
import CodeContext from "../../../../../store/code-context";
import Image from "next/image";
import { Restart, Run, Stop, Unlink } from "../../../../../types/editor";

declare global {
	interface String {
		insert(index: number, string: string): string;
	}
}

String.prototype.insert = function (index: number, string: string) {
	const ind = index < 0 ? this.length + index : index;
	return this.substring(0, ind) + string + this.substring(ind);
};

let Console: any = () => <></>;
let Hook: any = () => {};
let Unhook: any = () => {};

interface Props {
	data: TProject;
	subsystem: string;
	subsystemIndex: number;
}

const Code = ({ data, subsystem, subsystemIndex }: Props) => {
	const consoleRef = useRef<HTMLDivElement>(null);
	const {} = useMixpanel("project_create_code");
	const { globalSession } = useContext(GlobalSessionContext);
	const { codeLayout, codeTab } = useContext(CodeContext);
	const { post } = useApi();
	const [logs, setLogs] = useState<any[]>([]);
	const [unityLoaded, setUnityLoaded] = useState(false);
	const [unityContext, sensorData, gameState, resetScene] = useUnity({
		project: data.id,
		scenePrefix: data.scenePrefix,
		suffix: "",
		index: subsystemIndex,
		wip: data.wip,
		setLoaded: setUnityLoaded,
	});

	useEffect(() => {
		if (!globalSession.loaded) return;
		(async () => {
			let saves = {};
			await post("/api/profile/read-saves", { profileId: globalSession.profileId, properties: [data.id] }, (savesData) => (saves = savesData.content[data.id]));
			post("/api/profile/update-saves", { profileId: globalSession.profileId, update: { [data.id]: { ...saves, [subsystem]: "code" } }, date: new Date().toString() });
			console.log("code page saved");
		})();
	}, [globalSession.loaded, globalSession.profileId, data.id, post, subsystem]);

	useEffect(() => {
		if (!consoleRef.current) return;
		consoleRef.current.scrollTop = consoleRef.current.scrollHeight - consoleRef.current.clientHeight;
	}, [logs]);

	useEffect(() => {
		(async () => {
			({ Console, Hook, Unhook } = await import("console-feed"));
		})();
	}, []);

	const run: Run = async (code) => {
		Hook(window.console, (log: any) => setLogs((state) => [...state, log]), false);

		const whileEntry: number[] = [];
		Esprima.parseScript(code, { loc: true, range: true }, (node: any) => {
			console.log(node);
			if (node.type === "WhileStatement") {
				whileEntry.push(node.body.range[0]);
			}
		});
		whileEntry.forEach((pos) => {
			code = code.insert(pos + 1, `# insert code here`);
		});

		console.log(whileEntry);
		console.log(code);
		// console.log(Escodegen.generate(ast));
		Unhook(window.console);
	};

	const stop: Stop = () => {
		Unhook(window.console);
	};

	const restart: Restart = () => {
		// TODO @louis
	};

	const unlink: Unlink = () => {
		// TODO @louis
	};

	return (
		<div className={classes.page}>
			<div className={`${classes.main} ${classes[`${codeLayout.toLowerCase()}Layout`]}`}>
				<div className={classes.editor}>
					<Editor run={run} stop={stop} restart={restart} unlink={unlink} />
				</div>
				<div className={classes.unity}>
					<Unity unityContext={unityContext as UnityContext} unityLoaded={unityLoaded} />
				</div>
				<div className={classes.consoleContainer}>
					<div className={classes.consoleHeader}>
						<div className={classes.consoleTitle}>Console</div>
						<div className={classes.consoleBtnContainer}>
							<button title="Clear console" className={classes.clearConsole} onClick={() => setLogs([])}>
								<Image src={`https://raw.githubusercontent.com/CreateBaseNZ/public/dev/project-pages/clear-console.svg`} height={24} width={24} alt="Clear console" />
							</button>
						</div>
					</div>
					<div ref={consoleRef} className={classes.consoleWrapper}>
						{Console && <Console logs={logs} variant="dark" />}
					</div>
				</div>
			</div>
		</div>
	);
};

Code.getLayout = (page: ReactElement, pageProps: any) => {
	return (
		<ProjectLayout step="Create" substep="code" isFlat={true} hasLeftPanel={true} data={pageProps.data} subsystem={pageProps.subsystem}>
			{page}
		</ProjectLayout>
	);
};

Code.auth = "user";

export default Code;

interface Params {
	params: {
		id: string;
		subsystem: string;
		subsystemIndex: number;
	};
}

export async function getStaticProps({ params }: Params) {
	return {
		props: {
			data: ALL_PROJECTS_OBJECT[params.id],
			subsystem: params.subsystem,
			subsystemIndex: ALL_PROJECTS_OBJECT[params.id].subsystems.findIndex((subsys) => subsys.id === params.subsystem),
		},
	};
}

export async function getStaticPaths() {
	return {
		paths: ALL_PROJECTS_ARRAY.map((project) => {
			return project.subsystems.map((subsystem) => {
				return {
					params: {
						id: project.id,
						subsystem: subsystem.id,
					},
				};
			});
		}).flat(),
		fallback: false,
	};
}
