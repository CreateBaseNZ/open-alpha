import { useContext, useState, useEffect, useRef } from "react";
import router from "next/router";
import Head from "next/head";
import useApi from "../../hooks/useApi";
import GlobalSessionContext from "../../store/global-session-context";
import HeaderToggle from "../Layouts/MainLayout/HeaderToggle";
import Table from "../UI/Table/Table";
import { PrimaryButton, TertiaryButton } from "../UI/Buttons";
import AddGroupUserModal from "./AddGroupUserModal";

import { COLUMNS, SIZES } from "../../constants/manageGroup";
import classes from "../../styles/manageGroup.module.scss";

const ManageGroup = ({ role }) => {
	const ref = useRef();
	const { globalSession, setGlobalSession } = useContext(GlobalSessionContext);
	const { post } = useApi();
	const [data, setData] = useState([]);
	const [showAddModal, setShowAddModal] = useState(false);

	useEffect(async () => {
		await post(
			"/api/groups/fetch-users",
			{
				licenseId: globalSession.groups[globalSession.recentGroups[0]].licenseId,
				schoolId: globalSession.groups[globalSession.recentGroups[0]].id,
			},
			(data) => ref.current && setData(data.content.filter((user) => user.role === role && user.status !== "deactivated")),
			(data) => {
				if (data.content === "unauthorised") {
					router.replace("/404");
				}
			}
		);
		return () => (ref.current = null);
	}, []);

	useEffect(() => {
		if (router.query.add) {
			setShowAddModal(true);
		}
	}, [router.query.add]);

	if (!role) {
		router.replace("/manage-group/students");
		return null;
	}

	const renderBtns = [
		(key, data, selectedRowIds) =>
			role === "teacher" &&
			globalSession.groups[globalSession.recentGroups[0]]?.role === "admin" && (
				<TertiaryButton
					key={key}
					mainLabel="Promote"
					className={`${classes.btn} ${classes.promoteBtn}`}
					iconLeft={<i className="material-icons-outlined">add_moderator</i>}
					onClick={async () => {
						const input = {
							groupId: globalSession.groups[globalSession.recentGroups[0]].id,
							licenseIds: Object.keys(selectedRowIds).map((i) => data[i].licenseId),
							licenseId: globalSession.groups[globalSession.recentGroups[0]].licenseId,
							date: new Date().toString(),
						};
						await post("/api/groups/promote-users", input, () => {
							setData((state) => state.filter((_, i) => !Object.keys(selectedRowIds).includes(i.toString())));
							setGlobalSession((state) => ({
								...state,
								groups: state.groups.map((group) =>
									group.id === input.groupId
										? {
												...group,
												numOfUsers: { ...group.numOfUsers, teachers: group.numOfUsers.teachers - input.licenseIds.length, admins: group.numOfUsers.admins + input.licenseIds.length },
										  }
										: group
								),
							}));
						});
					}}
				/>
			),
		(key, data, selectedRowIds) =>
			(globalSession.groups[globalSession.recentGroups[0]]?.role === "admin" || (globalSession.groups[globalSession.recentGroups[0]]?.role === "teacher" && role === "student")) && (
				<TertiaryButton
					key={key}
					mainLabel="Remove"
					className={`${classes.btn} ${classes.removeBtn}`}
					iconLeft={<i className="material-icons-outlined">person_remove</i>}
					onClick={async () => {
						const input = {
							groupId: globalSession.groups[globalSession.recentGroups[0]].id,
							licenseId: globalSession.groups[globalSession.recentGroups[0]].licenseId,
							licenseIds: Object.keys(selectedRowIds).map((i) => data[i].licenseId),
							date: new Date().toString(),
							role,
						};
						await post("/api/groups/remove-users", input, () => {
							setData((state) => state.filter((_, i) => !Object.keys(selectedRowIds).includes(i.toString())));
							setGlobalSession((state) => ({
								...state,
								groups: state.groups.map((group) => (group.id === input.groupId ? { ...group, numOfUsers: { ...group.numOfUsers, [role]: group.numOfUsers[role] - input.licenseIds.length } } : group)),
							}));
						});
					}}
				/>
			),
	];

	return (
		<div className={classes.manageGroup}>
			<Head>
				<title>
					{role.charAt(0).toUpperCase()}
					{role.slice(1)}s • {globalSession.groups[globalSession.recentGroups[0]].name} | CreateBase
				</title>
				<meta name="description" content="Log into your CreateBase account" />
			</Head>
			<h2 ref={ref} className={classes.header}>
				{role}s
				<PrimaryButton className={classes.addBtn} onClick={() => setShowAddModal(true)} mainLabel="Add" iconLeft={<i className="material-icons-outlined">person_add</i>} />
				<HeaderToggle />
			</h2>
			<Table columns={COLUMNS} data={data} pageSizes={SIZES} renderBtns={renderBtns} />
			{showAddModal && <AddGroupUserModal setShow={setShowAddModal} role={role} />}
		</div>
	);
};

export default ManageGroup;
