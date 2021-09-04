// IMPORT ===================================================

import axios from "axios";
import { getSession } from "next-auth/client";

// MAIN =====================================================

export default async function (req, res) {
	if (req.method !== "POST") return;
	// Validate PUBLIC_API_KEY
	if (req.body.PUBLIC_API_KEY !== process.env.PUBLIC_API_KEY) {
		return res.status(403).send({ status: "critical error", content: "Invalid API key" });
	}
	// Check if a session exist
	const session = await getSession({ req });
	if (!session) {
		return res.status(400).send({ status: "critical error", content: "Please log in" });
	}
	// Create the input object
	const input = { license: session.user.license, password: req.body.input.password };
	// Send the data to the main backend
	let data;
	try {
		data = (await axios.post("http://localhost/license/validate-password", { PRIVATE_API_KEY: process.env.PRIVATE_API_KEY, input }))["data"];
	} catch (error) {
		if (error.response) {
			return res.status(error.response.status).send({ status: "error", content: error.response.data });
		} else if (error.request) {
			return res.status(504).send({ status: "error", content: error.request });
		} else {
			return res.status(500).send({ status: "error", content: error.message });
		}
	}
	// Validate response
	if (data.content === "Invalid Private API key") {
		return res.status(403).send(data);
	}
	// Success handler
	return res.status(200).send(data);
}

// SECONDARY ================================================

// HELPER ===================================================
