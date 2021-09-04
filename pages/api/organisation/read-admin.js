// IMPORT ===================================================

import axios from "axios";
import { getSession } from "next-auth/client";

// MAIN =====================================================

export default async function (req, res) {
	if (req.method !== "POST") return;
	// Validate PUBLIC_API_KEY
	if (req.body.PUBLIC_API_KEY !== process.env.PUBLIC_API_KEY) {
		return res.send({ status: "critical error", content: "Invalid API key" });
	}
	// Check if a session exist
	const session = await getSession({ req });
	if (!session) {
		return res.send({ status: "critical error", content: "This user is not logged in" });
	}
	// Validate if the user is an admin
	if (session.user.access !== "admin" /*|| !session.user.verified*/) {
		return res.send({ status: "critical error", content: "Invalid access" });
	}
	// Create the input data
	const input = { organisation: session.user.organisation };
	// Send the request
	let data;
	try {
		data = (await axios.post("https://createbase.co.nz/organisation/admin-read", { PRIVATE_API_KEY: process.env.PRIVATE_API_KEY, input }))["data"];
	} catch (error) {
		return res.send({ status: "error", content: error });
	}
	// Return outcome of the request
	return res.send(data);
}

// SECONDARY ================================================

// HELPER ===================================================
