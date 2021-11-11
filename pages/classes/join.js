import { useContext, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useForm } from "react-hook-form";
import axios from "axios";
import MainLayout from "../../components/Layouts/MainLayout/MainLayout";
import { SearchBar } from "../../components/UI/Input";
import { PrimaryButton } from "../../components/UI/Buttons";

import classes from "../../styles/classes.module.scss";
import GlobalSessionContext from "../../store/global-session-context";
import useHandleResponse from "../../hooks/useHandleResponse";
import router from "next/router";
import VisualBellContext from "../../store/visual-bell-context";

const ClassJoin = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [queriedClasses, setQueriedClasses] = useState([]);
	const { globalSession } = useContext(GlobalSessionContext);
	const { handleResponse } = useHandleResponse();
	const { setVisualBell } = useContext(VisualBellContext);
	const { register, handleSubmit, watch } = useForm({ mode: "onTouched" });
	const queryValue = watch("searchQuery");

	useEffect(async () => {
		let data = {};
		const details = { licenseId: globalSession.groups[globalSession.recentGroups[0]].licenseId, schoolId: globalSession.groups[globalSession.recentGroups[0]].id };
		const DUMMY_STATUS = "succeeded";
		try {
			data = (await axios.post("/api/classes/fetch-all", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY, input: details, status: DUMMY_STATUS }))["data"];
		} catch (error) {
			data.status = "error";
		} finally {
			console.log(data);
			handleResponse({
				data,
				failHandler: () => {},
				successHandler: () => setQueriedClasses(data.content),
			});
		}
	}, []);

	const onSubmit = async (inputs) => {
		setIsLoading(true);
		const { searchQuery, ...rest } = inputs;
		inputs = rest;
		const details = {
			licenseId: globalSession.groups[globalSession.recentGroups[0]].licenseId,
			schoolId: globalSession.groups[globalSession.recentGroups[0]].id,
			classes: Object.keys(inputs).filter((key) => inputs[key]),
		};
		if (!details.classes.length) {
			return setIsLoading(false);
		}
		console.log(details);

		let data = {};

		const DUMMY_STATUS = "succeeded";
		try {
			data = (await axios.post("/api/classes/fetch-all", { PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY, input: details, status: DUMMY_STATUS }))["data"];
		} catch (error) {
			data.status = "error";
		} finally {
			console.log(data);
			handleResponse({
				data,
				failHandler: () => {},
				successHandler: () => {
					setVisualBell({ type: "success", message: `Request${details.classes.length === 1 ? "" : "s"} sent` });
					router.push("/classes");
				},
			});
		}
	};

	return (
		<div className={classes.view}>
			<Head>
				<title>Join a Class | CreateBase</title>
				<meta name="description" content="Create a new class on CreateBase" />
			</Head>
			<Link href="/classes">
				<button className={classes.backBtn} title="Back to classes">
					<i className="material-icons-outlined">chevron_left</i>Back
				</button>
			</Link>
			<div className={`${classes.container} roundScrollbar`}>
				<div className={`${classes.wrapper} ${classes.formWrapper}`}>
					<div className={classes.h2Container}>
						<h2>Join a class</h2>
					</div>
					<form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
						<SearchBar
							className={classes.input}
							label={`Search for a class in ${globalSession.groups[globalSession.recentGroups[0]].name}`}
							labelProps={{ className: classes.inputLabel }}
							inputProps={{ placeholder: "Class name", type: "text", maxLength: 254, ...register("searchQuery") }}
						/>
						<div className={`${classes.queryContainer} roundScrollbar`}>
							{queriedClasses.map(
								(_class) =>
									_class.name.toLowerCase().includes((queryValue || "").toLowerCase()) && (
										<div className={`${classes.queryItem} ${_class.joined ? classes.disabled : ""}`} key={_class.id}>
											<input type="checkbox" id={_class.id} name={_class.id} {...register(_class.id)} />
											<label>
												{_class.name} <i className={`material-icons-outlined ${classes.addIcon}`}>add_circle_outline</i>
												<i className={`material-icons ${classes.checkIcon}`}>check_circle</i>
												<span>Already in this class</span>
											</label>
										</div>
									)
							)}
						</div>
						<PrimaryButton className={classes.submit} isLoading={isLoading} type="submit" loadingLabel="Sending requests ..." mainLabel="Request to join" />
					</form>
				</div>
			</div>
		</div>
	);
};

ClassJoin.getLayout = function getLayout(page) {
	return <MainLayout page="classes">{page}</MainLayout>;
};

ClassJoin.auth = "user";

export default ClassJoin;
