/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface IRPCProtocol {
	/**
	 * Returns a proxy to an object addressable/named in the extension host process or in the renderer process.
	 */
	getProxy<T>(identifier: ProxyIdentifier<T>): Proxied<T>;

	/**
	 * Register manually created instance.
	 */
	set<T, R extends T>(identifier: ProxyIdentifier<T>, instance: R): R;

	/**
	 * Assert these identifiers are already registered via `.set`.
	 */
	assertRegistered(identifiers: ProxyIdentifier<any>[]): void;

	/**
	 * Wait for the write buffer (if applicable) to become empty.
	 */
	drain(): Promise<void>;
}

export class ProxyIdentifier<T> {
	public static count = 0;
	_proxyIdentifierBrand: void = undefined;

	public readonly sid: string;
	public readonly nid: number;

	constructor(sid: string) {
		this.sid = sid;
		this.nid = (++ProxyIdentifier.count);
	}
}

const identifiers: ProxyIdentifier<any>[] = [];

export function createProxyIdentifier<T>(identifier: string): ProxyIdentifier<T> {
	const result = new ProxyIdentifier<T>(identifier);
	identifiers[result.nid] = result;
	return result;
}

export type Proxied<T> = { [K in keyof T]: T[K] extends (...args: infer A) => infer R
	? (...args: A) => Promise<Awaited<R>>
	: never
};

export function getStringIdentifierForProxy(nid: number): string {
	return identifiers[nid].sid;
}

/**
 * Marks the object as containing buffers that should be serialized more efficiently.
 */
export class SerializableObjectWithBuffers<T> {
	constructor(
		public readonly value: T
	) { }
}
