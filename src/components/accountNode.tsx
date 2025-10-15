import { useCallback, useState } from "react";
import LoadingSpinner from "./generic/loadingSpinner";
import { showError } from "../utils/utils";
import { MALAuth } from "../external/auth/malAuth";
import BadResponse from "../external/responses/badResponse";
import "./accountNode.css";
import Dropdown from "./generic/dropdown";
import dropdownIcon from "../assets/dropdown.png";
import useSignal from "../utils/useSignal";
import { FullSizeButtonList } from "./generic/fullSizeButtonList";

export default function AccountNode() {
	const [userData, setUserDataState] = useState<
		{ userName: string; imgUrl?: string } | "loading" | null
	>(null);

	useSignal(
		MALAuth.instance.userTokenSignal,
		useCallback((malUserToken) => {
			(async () => {
				if (!malUserToken) {
					setUserDataState(null);
					return;
				}

				setUserDataState("loading");
				const details = await malUserToken.getAccountDetails();
				if (!details || details instanceof BadResponse) {
					showError(details);
					setUserDataState(null);
					return;
				}

				setUserDataState({ userName: details.name });
				const fullDetails = await malUserToken.getAccountDetailsFull(
					details.name,
				);

				const defaultImg =
					"https://cdn.myanimelist.net/images/kaomoji_mal_white.png";
				if (fullDetails instanceof BadResponse) {
					showError(fullDetails);
					setUserDataState({
						userName: details.name,
						imgUrl: defaultImg,
					});
					return;
				}

				setUserDataState({
					userName: details.name,
					imgUrl: fullDetails.data?.images.jpg.image_url ?? defaultImg,
				});
			})();
		}, []),
	);

	return (
		<div className="accountNode flexRow">
			{userData ? (
				userData === "loading" ? (
					<LoadingSpinner props={{ size: "2rem" }} />
				) : (
					<Dropdown
						dropdownButton={
							<div className="flexRow verticalCenterItems">
								<span>
									<b>{userData.userName}</b>
								</span>
								<img
									src={dropdownIcon}
									className="smallIcon mediumMargin"
								></img>
								<img
									className="accountImage"
									src={userData.imgUrl}
									width={225}
									height={225}
								/>
							</div>
						}
						buttonClass=""
					>
						<FullSizeButtonList className="accountDropdownMenu">
							<a
								href={`https://myanimelist.net/profile/${userData.userName}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								Profile
							</a>
							<a
								href={`https://myanimelist.net/animelist/${userData.userName}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								Anime List
							</a>
							<button
								onClick={() => {
									MALAuth.instance.logout();
								}}
							>
								Log Out
							</button>
						</FullSizeButtonList>
					</Dropdown>
				)
			) : (
				<button onClick={() => MALAuth.instance.login()}>Log In</button>
			)}
		</div>
	);
}
