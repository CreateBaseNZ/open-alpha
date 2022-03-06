import router from "next/router";
import axios from "axios";

export interface APIRes {
	status?: "succeeded" | "critical error" | "error" | "failed" | undefined;
	content?: any; // TODO
}

const useApi = () => {
	const reportError = async (type = "", route = "", message = "", metadata = {}) => {
		axios.post("/api/error", {
			API_KEY_PUBLIC: process.env.NEXT_PUBLIC_API_KEY,
			input: { type: type, route: route, date: new Date().toString(), message: message, metadata: metadata },
		});
	};

	const post = async (route = "", input = {}, successHandler: (data: any) => void = () => {}, failHandler: (data: any) => void = () => {}) => {
		let data: APIRes = {};
		try {
			data = (await axios.post(route, { API_KEY_PUBLIC: process.env.NEXT_PUBLIC_API_KEY, input: input }))["data"] as APIRes; // TODO
		} catch (error) {
			data.status = "error";
		} finally {
			switch (data?.status) {
				case "critical error":
					reportError(router.asPath, "critical error", `A user in ${router.asPath} route encountered a critical error while making a request to ${route}`, { backendRoute: route, data });
					return router.push("/404");
				case "error":
					reportError(router.asPath, "error", `A user in ${router.asPath} route encountered an error while making a request to ${route}`, { backendRoute: route, data });
					return router.push("/404");
				case "failed":
					return failHandler(data);
				default:
					return successHandler(data);
			}
		}
	};

	return { post, reportError };
};

export default useApi;
