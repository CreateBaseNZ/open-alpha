import { useContext, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import useOrganisationHelper from "../../hooks/useOrganisationHelper";
import UserSessionContext from "../../store/user-session";
import Table from "./Table";
// import TableControls from "./TableControls";
// import TableHead from "./TableHead";
import GROUP_CONFIG, { COLUMNS, SCHOOL_TABS, SIZES } from "../../constants/manageGroup";
import MainLayout from "../Layouts/MainLayout/MainLayout";
import InnerLayout from "../Layouts/InnerLayout/InnerLayout";

import classes from "/styles/manageGroup.module.scss";
import { useRouter } from "next/router";

const ManageGroup = ({ collapseHeader, setCollapseHeader, userType }) => {
	const router = useRouter();
	const { userSession } = useContext(UserSessionContext);
	const { getOrgUsers } = useOrganisationHelper();
	const [allUsers, setAllUsers] = useState(Object.assign({}, ...Object.entries({ ...GROUP_CONFIG[userSession.view.groupType].userTypes }).map(([_, b]) => ({ [b.name]: [] }))));
	const [search, setSearch] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
	const [showChangePassword, setShowChangePassword] = useState(false);

	console.log(userType);

	if (!userType) {
		router.replace("/manage-group/students");
		return null;
	}

	useEffect(async () => {
		await getOrgUsers({
			successHandler: (data) => {
				let result = Object.keys(data.users).reduce((res, key) => {
					return {
						...res,
						[key]: data.users[key].map((user) => ({ firstName: user.firstName, lastName: user.lastName, email: user.email, checked: false, index: data.users[key].length })),
					};
				}, {});
				setAllUsers(result);
			},
		});
		setIsLoading(false);
		console.log("fetched data");
	}, []);

	const removeUserHandler = () => {
		//TODO [IGNORE]
		setShowRemoveConfirm(false);
	};

	const promoteHandler = () => {};

	const searchHandler = (e) => {
		setIsLoading(true);
		setSearch(e.target.value);
	};

	const data = useMemo(
		() => [
			{ firstName: "John", lastName: "Doe", email: "johndoe@gmail.com" },
			{ firstName: "Doe", lastName: "John", email: "doejohn@gmail.com" },
			{ firstName: "Dohn", lastName: "Joe", email: "dohnjoe@gmail.com" },
		],
		[]
	);

	const columns = useMemo(() => COLUMNS, []);

	return (
		<div className={classes.manageGroup}>
			<Head>
				<title>
					Manage {userType} • {userSession.view.groupName} | CreateBase
				</title>
				<meta name="description" content="Log into your CreateBase account" />
			</Head>
			{/* <TableControls
				isChecked={isChecked}
				tab={tab}
				setTab={setTab}
				tabs={tabs}
				allUsers={allUsers}
				collapseHeader={collapseHeader}
				setCollapseHeader={setCollapseHeader}
				search={search}
				searchHandler={searchHandler}
				removeUserHandler={removeUserHandler}
				showRemoveConfirm={showRemoveConfirm}
				setShowRemoveConfirm={setShowRemoveConfirm}
				showChangePassword={showChangePassword}
				setShowChangePassword={setShowChangePassword}
			/> */}
			<Table columns={columns} data={data} pageSizes={SIZES} />
		</div>
	);
};

// ManageGroup.getLayout = function getLayout(page) {
// 	return (
// 		<MainLayout page="manage-group">
// 			<InnerLayout tabs={SCHOOL_TABS}>{page}</InnerLayout>
// 		</MainLayout>
// 	);
// };

// ManageGroup.authorisation = "staff";

export default ManageGroup;
