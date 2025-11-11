import { Fragment, useCallback, useId, useState } from "react";
import { showError, sleepFor } from "../utils/utils";
import { MALAuth } from "../external/auth/malAuth";
import BadResponse from "../external/responses/badResponse";
import "./accountNode.css";
import Dropdown from "./generic/dropdown";
import dropdownIcon from "assets/dropdown.png";
import useSignal from "../utils/useSignal";
import { FullSizeButtonList } from "./generic/fullSizeButtonList";
import { TMDBAuth } from "../external/auth/tmdbAuth";
import {
	getExternalHomepage,
	getExternalLogo,
	type ExternalLinkToValueType,
} from "../models/externalLink";
import type IAuth from "../external/auth/IAuth";

type UserDataType = ExternalLinkToValueType<
	{ userName: string; imgUrl?: string } | "loading" | null
>;

const externalLinkValues: ExternalLinkToValueType<{
	profileLink: (userName: string) => string;
	listLinks: (userName: string) => { label: string; link: string }[];
	authInstance: IAuth;
}> = {
	MAL: {
		profileLink: (userName: string) =>
			`https://myanimelist.net/profile/${userName}`,
		listLinks: (userName: string) => [
			{
				label: "Anime List",
				link: `https://myanimelist.net/animelist/${userName}`,
			},
		],
		authInstance: MALAuth.instance,
	},
	TMDB: {
		profileLink: (userName: string) =>
			`https://www.themoviedb.org/u/${userName}`,
		listLinks: (userName: string) => [
			{
				label: "Movie WatchList",
				link: `https://www.themoviedb.org/u/${userName}/watchlist/movie`,
			},
			{
				label: "TV WatchList",
				link: `https://www.themoviedb.org/u/${userName}/watchlist/tv`,
			},
			{
				label: "Movie Ratings",
				link: `https://www.themoviedb.org/u/${userName}/ratings/movie`,
			},
			{
				label: "TV Ratings",
				link: `https://www.themoviedb.org/u/${userName}/ratings/tv`,
			},
		],
		authInstance: TMDBAuth.instance,
	},
};

export default function AccountNode() {
	const [userDatas, setUserDataState] = useState<UserDataType>({
		MAL: null,
		TMDB: null,
	});

	useSignal(
		MALAuth.instance.userTokenSignal,
		useCallback((malUserToken) => {
			function setMalData(
				data: { userName: string; imgUrl?: string } | "loading" | null,
			) {
				setUserDataState((prev) => ({ ...prev, MAL: data }));
			}
			if (!malUserToken) {
				setMalData(null);
				return;
			}
			setMalData("loading");
			(async () => {
				const details = await malUserToken.getAccountDetails();
				if (!details || details instanceof BadResponse) {
					showError(details);
					setMalData(null);
					return;
				}

				setMalData({ userName: details.name });
				const fullDetails = await malUserToken.getAccountDetailsFull(
					details.name,
				);

				const defaultImg =
					"https://cdn.myanimelist.net/images/kaomoji_mal_white.png";
				if (fullDetails instanceof BadResponse) {
					showError(fullDetails);
					setMalData({
						userName: details.name,
						imgUrl: defaultImg,
					});
					return;
				}

				setMalData({
					userName: details.name,
					imgUrl: fullDetails.data?.images.jpg.image_url ?? defaultImg,
				});
			})();
		}, []),
	);

	useSignal(
		TMDBAuth.instance.userTokenSignal,
		useCallback((tmdbUserToken) => {
			function setTMDBData(
				data: { userName: string; imgUrl?: string } | "loading" | null,
			) {
				setUserDataState((prev) => ({ ...prev, TMDB: data }));
			}
			if (!tmdbUserToken) {
				setTMDBData(null);
				return;
			}
			setTMDBData("loading");

			(async () => {
				const accountDetailsResponse = await tmdbUserToken.getAccountDetails();
				if (accountDetailsResponse instanceof BadResponse) {
					showError(accountDetailsResponse, null, {
						showInProgressNode: true,
					});
					setTMDBData(null);
					return;
				}

				if (accountDetailsResponse.username == null) {
					showError("Missing username", null, {
						showInProgressNode: true,
					});
					setTMDBData(null);
					return;
				}

				const avatarPath = accountDetailsResponse.avatar?.tmdb?.avatar_path;
				const gravatarHash = accountDetailsResponse.avatar?.gravatar?.hash;

				setTMDBData({
					userName: accountDetailsResponse.username,
					imgUrl: avatarPath
						? `https://image.tmdb.org/t/p/w500${avatarPath}`
						: gravatarHash
							? `https://gravatar.com/avatar/${gravatarHash}`
							: undefined,
				});
			})();
		}, []),
	);

	const id = useId();

	return (
		<div className="accountNode flexRow">
			<Dropdown
				dropdownButton={
					<div className="flexRow verticalCenterItems">
						<span>Connections</span>
						<img src={dropdownIcon} className="smallIcon mediumMargin"></img>
					</div>
				}
			>
				<FullSizeButtonList className="accountDropdownMenu">
					{Object.keys(userDatas)
						.map((_key) => {
							const key = _key as keyof UserDataType;
							const userData = userDatas[key];

							const externalLinkData = externalLinkValues[key];

							const hasUserData = userData && userData !== "loading";

							return (
								<Fragment key={`${id}_${key}`}>
									<div className={"flexRow verticalCenterItems spaceBetween"}>
										<a
											href={getExternalHomepage(key)}
											target="_blank"
											rel="noopener noreferrer"
											className="staticStyle flexRow"
										>
											<img src={getExternalLogo(key)} width={25}></img>
										</a>
										{hasUserData ? (
											<a
												href={externalLinkData.profileLink(userData.userName)}
												target="_blank"
												rel="noopener noreferrer"
												className="flexRow verticalCenterItems listIgnore staticStyle"
											>
												<span className="smallMargin">
													<b>{userData.userName}</b>
												</span>
												<img
													className="accountImage"
													src={userData.imgUrl}
													width={225}
													height={225}
												/>
											</a>
										) : (
											<button
												onClick={() => {
													externalLinkData.authInstance.login();
												}}
												className="listIgnore transparentBackground"
											>
												Login
											</button>
										)}
									</div>
									{!hasUserData ? null : (
										<>
											<div className="listIgnore externalLinksGrid">
												{externalLinkData
													.listLinks(userData.userName)
													.map(({ label, link }, index) => (
														<a
															key={`${id}_${key}_listLink_${index}`}
															href={link}
															target="_blank"
															rel="noopener noreferrer"
														>
															{label}
														</a>
													))}
											</div>

											<button
												onClick={async () => {
													await sleepFor(0); // required so that the onOutsideCLick handler on the dropdown will run first
													externalLinkData.authInstance.logout();
												}}
											>
												Log Out
											</button>
										</>
									)}
								</Fragment>
							);
						})
						.reduce((lhs, rhs) => (
							<>
								{lhs}
								<hr
									style={{
										backgroundColor: "var(--colAccent)",
										width: "100%",
									}}
								/>
								{rhs}
							</>
						))}
				</FullSizeButtonList>
			</Dropdown>
		</div>
	);
}
