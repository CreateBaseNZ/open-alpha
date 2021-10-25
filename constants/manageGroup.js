const GROUP_CONFIG = {
	school: {
		userTypes: [
			{ title: "Students", name: "students", icon: "backpack" },
			{ title: "Teachers", name: "teachers", icon: "school" },
			{ title: "Admins", name: "admin", icon: "verified_user" },
		],
	},
	family: {
		userTypes: [{ title: "", name: "", icon: "" }],
	},
};

export default GROUP_CONFIG;

export const SCHOOL_TABS = [
	{ title: "Students", name: "students", icon: "backpack", pathname: "/manage-group/students" },
	{ title: "Teachers", name: "teachers", icon: "school", pathname: "/manage-group/teachers" },
	{ title: "Admins", name: "admin", icon: "verified_user", pathname: "/manage-group/admins" },
];

export const COLUMNS = [
	{ Header: "First Name", accessor: "firstName" },
	{ Header: "Last Name", accessor: "lastName" },
	{ Header: "Email", accessor: "email" },
];

export const SIZES = [10, 20, 50, 100];
