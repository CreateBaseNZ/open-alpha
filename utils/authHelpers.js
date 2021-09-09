import router from "next/router";
import { signIn } from "next-auth/client";
import axios from "axios";
import { getSession } from "next-auth/client";

export const getOrgData = async () => {
	let orgData;
	try {
		orgData = (await axios.post("/api/organisation/read-account", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY }))["data"];
	} catch (error) {
		alert("Something went wrong, please reload the page and try again. If this problem persists, please get in touch with us.");
	}
	return {
		name: orgData.content.name,
		city: orgData.content.location.city,
		country: orgData.content.location.country,
		admins: orgData.content.numberOfLicenses.admin,
		educators: orgData.content.numberOfLicenses.educator,
		learners: orgData.content.numberOfLicenses.learner,
	};
};

export const initSession = async (loading, session, callback) => {
	if (!loading) {
		if (session) {
			let profileData;
			try {
				profileData = (await axios.post("/api/profile/read", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY, input: { properties: ["displayName"], saves: ["teachingFirst"] } }))["data"];
			} catch (error) {
				alert("Something went wrong, please reload the page and try again. If this problem persists, please get in touch with us.");
			}
			let licenseData;
			try {
				licenseData = (await axios.post("/api/license/read", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY, input: { properties: ["username"] } }))["data"];
			} catch (error) {
				alert("Something went wrong, please reload the page and try again. If this problem persists, please get in touch with us.");
			}
			let org = null;
			if (session.user.organisation) {
				org = await getOrgData();
			}
			const { access, verified } = (await getSession())["user"];
			return callback({
				loaded: true,
				type: access,
				username: licenseData.content.username,
				displayName: profileData.content.displayName,
				org: org,
				saves: profileData.content.saves,
				verified: verified,
			});
		} else {
			return callback({
				loaded: true,
				type: null,
			});
		}
	}
};

export const logIn = async (username, password, catastropheHandler, failHandler, successHandler) => {
	const result = await signIn("credentials", {
		redirect: false,
		user: username,
		password: password,
		PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
	});

	if (result.error) {
		const error = JSON.parse(result.error);
		if (error.status === "failed") {
			return failHandler();
		} else {
			return catastropheHandler();
		}
	}

	successHandler();
	router.replace("/onboarding");
};

export const sendForgotPasswordCode = async (email, criticalHandler, errorHandler, failHandler, successHandler) => {
	let data;
	try {
		data = (await axios.post("/api/auth/reset-password-email", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY, input: { email: email } }))["data"];
	} catch (error) {
		return criticalHandler();
	}
	if (data.status === "critical error") {
		return criticalHandler();
	} else if (data.status === "error") {
		return errorHandler();
	} else if (data.status === "failed") {
		return failHandler(data.content);
	}
	return successHandler();
};

export const resetPassword = async (inputs, criticalHandler, errorHandler, failHandler, successHandler) => {
	let data;
	try {
		data = (await axios.post("/api/auth/reset-password", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY, input: inputs }))["data"];
	} catch (error) {
		return criticalHandler();
	}
	if (data.status === "critical error") {
		return criticalHandler();
	} else if (data.status === "error") {
		return errorHandler();
	} else if (data.status === "failed") {
		return data.content.code ? failHandler() : successHandler();
	}
	return successHandler();
};

export const verifyAccount = async (code, criticalHandler, errorHandler, failHandler, successHandler) => {
	let data;
	try {
		data = (await axios.post("/api/auth/account-verify", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY, input: code }))["data"];
	} catch (error) {
		return criticalHandler();
	}
	if (data.status === "critical error") {
		return criticalHandler();
	} else if (data.status === "error") {
		return errorHandler();
	} else if (data.status === "failed") {
		return failHandler(data.content);
	}
	return successHandler();
};

export const resendVerificationCode = async (successHandler) => {
	let data;
	try {
		data = (await axios.post("/api/auth/account-verification-email", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY }))["data"];
	} catch (error) {
		alert("An unexpected error occurred, please reload the page and try again. If this problem persists, please contact us.");
	}
	successHandler();
};
