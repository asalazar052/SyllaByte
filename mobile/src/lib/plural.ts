// '1 date', '3 dates'. Pass `many` only when the plural isn't just the singular with an 's'.
export function plural(count: number, one: string, many = `${one}s`) {
	return `${count} ${count === 1 ? one : many}`;
}
