import Head from "next/head";
import InnerLayout from "../../../components/Layouts/InnerLayout/InnerLayout";
import MainLayout from "../../../components/Layouts/MainLayout/MainLayout";
import CLASSES_TABS from "../../../constants/classesTabs";

import classes from "../../../components/Classes/Announcements.module.scss";
import { useContext } from "react";
import ClassesContext from "../../../store/classes-context";

const ClassesAnnouncements = () => {
	const { classSession } = useContext(ClassesContext);

	return (
		<div className={classes.view}>
			<Head>
				<title>Announcements • {classSession.name} | CreateBase</title>
				<meta name="description" content="View your class announcements" />
			</Head>
			<h1>Announcements</h1>
			Coming soon!
		</div>
	);
};

ClassesAnnouncements.getLayout = function getLayout(page) {
	return (
		<MainLayout page="classes">
			<InnerLayout tabs={CLASSES_TABS} backHref="/classes">
				{page}
			</InnerLayout>
		</MainLayout>
	);
};

export default ClassesAnnouncements;
