import useApi from "../../hooks/useApi";
import { PrimaryButton, TertiaryButton } from "../UI/Buttons";
import classes from "./Notification.module.scss";

const GroupRequestNotification = ({ notification, setNotifications }) => {
	const { post } = useApi();

	const approveHandler = async () => {
		await post({
			route: "/api/groups/approve-teacher",
			input: { licenseId: notification.params.user.licenseId, groupId: notification.params.group.id, date: new Date().toString() },
			successHandler: () => setNotifications((state) => state.filter((notif) => notif.id !== notification.id)),
		});
	};

	const denyHandler = async () => {
		await post({
			route: "/api/groups/deny-teacher",
			input: { licenseId: notification.params.user.licenseId, groupId: notification.params.group.id, date: new Date().toString() },
			successHandler: () => setNotifications((state) => state.filter((notif) => notif.id !== notification.id)),
		});
	};

	return (
		<div className={classes.notification}>
			<div className={classes.contents}>
				<div className={classes.tag}>{notification.params.group.name}</div>
				<div className={classes.title}>
					<span className={classes.bold}>
						{notification.params.user.firstName} {notification.params.user.lastName}
					</span>{" "}
					({notification.params.user.email}) would like to join your group <span className={`${classes.bold} ${classes.highlight}`}>{notification.params.group.name}</span>
				</div>
				<div className={classes.message}>
					<i className="material-icons-outlined">chat</i>
					{notification.params.message || "No message"}
				</div>
				<div className={classes.btnContainer}>
					<PrimaryButton mainLabel="Approve" onClick={approveHandler} />
					<TertiaryButton mainLabel="Deny" className={classes.deny} onClick={denyHandler} />
				</div>
			</div>
			{/* <button className={classes.delete} title="Clear" onClick={denyHandler}>
				<i className="material-icons-outlined">delete</i>
			</button> */}
		</div>
	);
};

export default GroupRequestNotification;
