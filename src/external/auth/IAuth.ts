export default interface IAuth {
	init(): void;
	authorize(): void;
	login(): void;
	logout(): void;
}
