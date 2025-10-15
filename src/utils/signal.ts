type SignalObserver<T> = (value: T) => void;

export default class Signal<T> {
	private _value: T;
	public get value() {
		return this._value;
	}
	public set value(newVal) {
		this._value = newVal;
	}

	constructor(initial: T) {
		this._value = initial;
	}

	private observers: Set<SignalObserver<T>> = new Set();

	public observe(observer: SignalObserver<T>) {
		this.observers.add(observer);
	}

	public unobserve(observer: SignalObserver<T>) {
		this.observers.delete(observer);
	}

	public notify(value: T) {
		this._value = value;
		this.observers.forEach((notifyObserver) => notifyObserver(value));
	}
}
