import { useContext, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import GlobalSessionContext from "../../store/global-session-context";
import router from "next/router";

const hasAccess = (role, auth) => {
	switch (auth) {
		case "admin":
			return role === "admin";
		case "staff":
			return role === "admin" || role === "teacher";
		default:
			return true;
	}
};

const AuthGuard = ({ children, auth }) => {
	const { globalSession } = useContext(GlobalSessionContext);

	useEffect(() => {
		if (globalSession.loaded) {
			if (!globalSession.accountId) {
				signIn();
			} else if (!globalSession.verified) {
				router.push({ pathname: "/auth/verify", query: router.query });
			}
		}
	}, [globalSession.loaded, globalSession.accountId, globalSession.verified]);

	if (!globalSession.loaded) return <div>App loading</div>;

	if (globalSession.accountId) {
		if (!globalSession.verified) {
			return null;
		} else if (hasAccess(globalSession.groups[globalSession.recentGroups[0]]?.role, auth)) {
			return children;
		} else {
			return <div>No access</div>;
		}
	}

	return <div>App loading</div>;
};

export default AuthGuard;
