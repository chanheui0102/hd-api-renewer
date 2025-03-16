// src/services/language.service.ts
export type Language = 'english' | 'korean' | 'spanish' | 'etc';

export const CountryLanguage: Record<Language, string[]> = {
    english: ['United States', 'Canada', 'Australia' /* ... */],
    korean: ['Korea, Republic of', "Korea, Democratic People's Republic of"],
    spanish: ['Spain', 'Mexico', 'Argentina' /* ... */],
    etc: [],
};

export class LanguageService {
    private countryLanguageMap: Map<string, Language>;

    constructor() {
        this.countryLanguageMap = new Map<string, Language>();
        // Build a map from country -> language
        (Object.keys(CountryLanguage) as Language[]).forEach((lang) => {
            const countries = CountryLanguage[lang];
            countries.forEach((country) => {
                this.countryLanguageMap.set(country, lang);
            });
        });
    }

    public getLanguageByCountry(country: string): Language {
        const language = this.countryLanguageMap.get(country);
        return language || 'english';
    }
}
