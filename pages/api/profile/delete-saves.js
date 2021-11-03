// IMPORT ===================================================

import axios from "axios";
import { getSession } from "next-auth/client";

// MAIN =====================================================

export default async function (req, res) {
	if (req.method !== "POST") return;
	// Validate PUBLIC_API_KEY
	if (req.body.PUBLIC_API_KEY !== process.env.PUBLIC_API_KEY) {
		return res.send({ status: "critical error", content: "" });
	}
	const input = req.body.input;
	// Create the input data
	let input = {
		query: { _id: input.profileId },
		properties: input.properties,
		date: input.date,
	};
	// Send the data to the main backend
	let data;
	try {
		data = (await axios.post(process.env.ROUTE_URL + "/profile/delete-saves", { PRIVATE_API_KEY: process.env.PRIVATE_API_KEY, input }))["data"];
	} catch (error) {
		return res.send({ status: "error", content: error });
	}
	// Return outcome of the request
	return res.send(data);
}

// SECONDARY ================================================

// HELPER ===================================================
