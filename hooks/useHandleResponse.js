import router from "next/router";

const useHandleResponse = () => {
	const handleResponse = ({ data, failHandler, successHandler }) => {
		switch (data.status) {
			case "critical error":
				return router.push("/404");
			case "error":
				return router.push("/404");
			case "failed":
				return failHandler(data);
			default:
				return successHandler(data);
		}
	};

	return { handleResponse };
};

export default useHandleResponse;
