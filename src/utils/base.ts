export function truncate(str: string, length: number = 5): string {
    // Guard clauses for edge cases
    if (length == 0) return "...";

    return `${str.slice(0, length)}...${str.slice(-length)}`;
}
