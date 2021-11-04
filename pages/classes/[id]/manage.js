import Head from "next/head";
import InnerLayout from "../../../components/Layouts/InnerLayout/InnerLayout";
import MainLayout from "../../../components/Layouts/MainLayout/MainLayout";
import CLASSES_TABS from "../../../constants/classesTabs";
import useClass from "../../../hooks/useClass";

import classes from "../../../components/Classes/Manage.module.scss";

const ClassesManage = () => {
	const { classObject, classLoaded } = useClass();

	if (!classLoaded) return null;

	return (
		<div className={classes.view}>
			<Head>
				<title>Manage • {classObject.name} | CreateBase</title>
				<meta name="description" content="View your class announcements" />
			</Head>
			<h1>Manage {classObject.name}</h1>
			Coming soon!
		</div>
	);
};

ClassesManage.getLayout = function getLayout(page) {
	return (
		<MainLayout page="classes">
			<InnerLayout tabs={CLASSES_TABS} backHref="/classes">
				{page}
			</InnerLayout>
		</MainLayout>
	);
};

ClassesManage.auth = "user";

export default ClassesManage;
