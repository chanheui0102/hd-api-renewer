// src/services/utility.service.ts
export class UtilityService {
    private generateRandomString() {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        let str1 = '';
        let str2 = '';
        for (let i = 0; i < 5; i++) {
            str1 += letters.charAt(Math.floor(Math.random() * letters.length));
        }

        const numbers = '0123456789';
        for (let i = 0; i < 5; i++) {
            str2 += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return [str1, str2];
    }

    private randomCombineStrings(str1: string, str2: string) {
        let combined = '';
        const maxLen = Math.max(str1.length, str2.length);
        for (let i = 0; i < maxLen; i++) {
            if (i < str1.length) combined += str1.charAt(i);
            if (i < str2.length) combined += str2.charAt(i);
        }
        return combined;
    }

    public getTemporaryPassword(): string {
        const [str1, str2] = this.generateRandomString();
        return this.randomCombineStrings(str1, str2);
    }
}
