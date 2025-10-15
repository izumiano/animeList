export class IResponse<T extends IResponseDataType> {
	statusCode: number | undefined;
	data: T | null;

	constructor(params: { statusCode?: number; data?: T }) {
		this.statusCode = params.statusCode;
		this.data = params.data ?? null;

		if (this.data) {
			if (Array.isArray(this.data)) {
				for (const d of this.data) {
					d.statusCode = this.statusCode;
				}
			} else {
				this.data.statusCode = this.statusCode;
			}
		}
	}
}

export type IResponseDataType = IResponseData | IResponseData[] | null;

export interface IResponseData {
	statusCode: number | undefined;
}
