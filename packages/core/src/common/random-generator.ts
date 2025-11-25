const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lower = upper.toLowerCase();
const digits = '0123456789';

const symbols = `${upper}${lower}${digits}`;
const symbolsLength = symbols.length;

export function generateRandom(length: number): string {
    let password = '';
    for (let i = 0; i < length; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbolsLength));
    }

    return password;
}
