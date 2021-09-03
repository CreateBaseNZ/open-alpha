// IMPORT ===================================================

import axios from "axios";
import { getSession } from "next-auth/client";
import { displayNameMinLength, displayNamePattern, emailPattern, passwordMinLength, usernameMinLength, usernamePattern } from "../../../utils/formValidation";

// MAIN =====================================================

export default async function (req, res) {
	if (req.method !== "POST") return;
	// Validate PUBLIC_API_KEY
	if (req.body.PUBLIC_API_KEY !== process.env.PUBLIC_API_KEY) {
		return res.status(403).send({ status: "critical error", content: "Invalid API Key" });
	}
	// Check if there is no user logged in
	const session = await getSession({ req });
	if (session) {
		return res.status(400).send({ status: "critical error", content: "A user is already logged in" });
	}
	// Validate the input data
	const validity = validate(req.body.input);
	if (validity.status === "failed") {
		return res.status(400).send(validity);
	}
	// Create the input data
	let input = {
		// learner data
		username: req.body.input.username,
		displayName: req.body.input.displayName,
		password: req.body.input.password,
		// organisation data
		name: req.body.input.name,
		code: req.body.input.code,
		type: req.body.input.type,
		country: req.body.input.country,
		metadata: req.body.input.metadata,
		// other data
		date: req.body.input.date,
	};
	input.search = createOrganisationSearchObject(req.body.input.name, req.body.input.type, req.body.input.country, req.body.input.metadata);
	// Send the data to the main backend
	let data;
	try {
		data = (await axios.post("http://localhost/signup/learner-organisation", { PRIVATE_API_KEY: process.env.PRIVATE_API_KEY, input }))["data"];
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
	if (data.content === "Invalid Private API Key") {
		return res.status(403).send(data);
	}
	// Success handler
	return res.status(200).send(data);
}

// SECONDARY ================================================

function createOrganisationSearchObject(name, type, country, metadata) {
	if (type === "school" && country === "new zealand") {
		return { name, "metadata.id": metadata.id };
	} else {
		return { name, type: "other" };
	}
}

function validate(object) {
	let valid = true;
	let errors = { email: "", username: "", displayName: "", password: "", date: "" };
	// Validate username
	const username = validateUsername(object.username);
	if (!username.status) {
		valid = false;
		errors.username = username.content;
	}
	// Validate display name
	const displayName = validateDisplayName(object.displayName);
	if (!displayName.status) {
		valid = false;
		errors.displayName = displayName.content;
	}
	// Validate password
	const password = validatePassword(object.password);
	if (!password.status) {
		valid = false;
		errors.password = password.content;
	}
	// Validate name
	const name = validateName(object.name);
	if (!name.status) {
		valid = false;
		errors.name = name.content;
	}
	// Validate code
	const code = validateCode(object.code);
	if (!code.status) {
		valid = false;
		errors.code = code.content;
	}
	// Validate type
	const type = validateType(object.type);
	if (!type.status) {
		valid = false;
		errors.type = type.content;
	}
	// Validate country
	const country = validateCountry(object.country);
	if (!country.status) {
		valid = false;
		errors.country = country.content;
	}
	// Validate metadata
	const metadata = validateMetadata(object.metadata);
	if (!metadata.status) {
		valid = false;
		errors.metadata = metadata.content;
	}
	// Validate date
	const date = validateDate(object.date);
	if (!date.status) {
		valid = false;
		errors.date = date.content;
	}
	// Evaluate outcome
	if (!valid) {
		return { status: "failed", content: errors };
	} else {
		return { status: "succeeded", content: errors };
	}
}

// HELPER ===================================================

function validateUsername(username) {
	if (!username) {
		return { status: false, content: "Please enter a username." };
	} else if (username.length < usernameMinLength.value) {
		return { status: false, content: usernameMinLength.message };
	} else if (!usernamePattern.value.test(username)) {
		return { status: false, content: usernamePattern.message };
	}
	return { status: true, content: "" };
}

function validateDisplayName(displayName) {
	if (!displayName) {
		return { status: false, content: "Please enter a display name." };
	} else if (displayName.length < displayNameMinLength.value) {
		return { status: false, content: displayNameMinLength.message };
	} else if (!displayNamePattern.value.test(displayName)) {
		return { status: false, content: displayNamePattern.message };
	}
	return { status: true, content: "" };
}

function validatePassword(password) {
	if (!password) {
		return { status: false, content: "Please enter a password name." };
	} else if (password.length < passwordMinLength.value) {
		return { status: false, content: passwordMinLength.message };
	} else if (!passwordValidate(password).status) {
		return { status: false, content: passwordValidate(password).content };
	}
	return { status: true, content: "" };
}

function passwordValidate(v) {
	const errors = [];
	if (!v.match(/(?=.*[a-z]){8,}/)) {
		errors.push("lowercase letter");
	}
	if (!v.match(/(?=.*[A-Z]){8,}/)) {
		errors.push("uppercase letter");
	}
	if (!v.match(/(?=.*?[0-9]){8,}/)) {
		errors.push("digit");
	}
	if (!v.match(/(?=.*?[#?!@$%^&*-]){8,}/)) {
		errors.push("special character");
	}
	if (errors.length) {
		return { status: false, content: "Requires at least one: " + errors.join(", ") };
	} else {
		return { status: true, content: "" };
	}
}

function validateName(name) {
	if (!name) {
		return { status: false, content: "Please enter the name of the organisation" };
	}
	return { status: true, content: "" };
}

function validateCode(code) {
	if (!code) {
		return { status: false, content: "Please enter the code for educators" };
	}
	return { status: true, content: "" };
}

function validateType(type) {
	if (!type) {
		return { status: false, content: "Please provide the type of the organisation" };
	}
	return { status: true, content: "" };
}

function validateCountry(country) {
	if (!country) {
		return { status: false, content: "Please provide the country of the organisation" };
	}
	return { status: true, content: "" };
}

function validateMetadata(metadata, type, country) {
	if (type === "school" && country === "new zealand") {
		if (!metadata) {
			return { status: false, content: "Please provide a metadata" };
		} else if (!metadata.id) {
			return { status: false, content: "Please enter your school ID" };
		}
	}
	return { status: true, content: "" };
}

function validateDate(date) {
	if (!date) {
		return { status: false, content: "Please enter a date name." };
	}
	return { status: true, content: "" };
}
