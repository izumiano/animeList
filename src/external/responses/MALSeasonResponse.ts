import type { IResponse } from "./IResponse";
import type { MALSeasonDetails } from "./MALSeasonDetails";

export type MALSeasonResponse = MALSeasonDetails & IResponse<null>;
