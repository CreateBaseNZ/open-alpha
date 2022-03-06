// IMPORT ===================================================

import axios from "axios";
import { getSession } from "next-auth/react";

// TEST OUTPUT ==============================================

// MAIN =====================================================

export default async function (req, res) {
	if (req.method !== "POST") return;
	if (req.body.API_KEY_PUBLIC !== process.env.API_KEY_PUBLIC) return res.send({ status: "critical error" });
	const session = await getSession({ req });
	// Fetch the user's account detail
	let email, profile;
	try {
		[email, profile] = await fetchAccount(session.user);
	} catch (error) {
		return res.send(error);
	}
	const input = req.body.input;
	const url = process.env.PREFIX_BACKEND + "/error/new";
	const keys = { API_KEY_PRIVATE: process.env.API_KEY_PRIVATE };
	const backendInput = { email, profile, route: input.route, type: input.type, date: input.date, message: input.message, metadata: input.metadata };
	console.log(backendInput);
	if (process.env.NODE_ENV !== "production") return res.send({ status: "succeeded", content: "development" });
	let data;
	try {
		data = (await axios.post(url, { ...keys, input: backendInput }))["data"];
	} catch (error) {
		data = { status: "error", content: error };
	}
	if (data.status !== "succeeded") return res.send({ status: "error" });
	return res.send({ status: "succeeded" });
}

// HELPERS ==================================================

function fetchAccount({ accountId, provider }) {
	return new Promise(async (resolve, reject) => {
		const url = process.env.PREFIX_BACKEND + "/account/retrieve";
		const keys = { API_KEY_PRIVATE: process.env.API_KEY_PRIVATE };
		let input = { provider };
		if (provider === "credentials") {
			input.query = { _id: accountId };
		} else if (provider === "google") {
			input.query = { googleId: accountId };
		}
		let data;
		try {
			data = (await axios.post(url, { ...keys, input }))["data"];
		} catch (error) {
			data = { status: "error", content: error };
		}
		if (data.status !== "succeeded") return reject(data);
		return resolve([data.content[0].email, data.content[0].profile]);
	});
}

// END ======================================================
