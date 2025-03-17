// src/services/translation.service.ts
import { v2 as GoogleTranslate } from '@google-cloud/translate';
import { TranslateVodDto } from '../dtos/translation/translate-vod.dto';

export class TranslationService {
    private translate: GoogleTranslate.Translate;

    constructor() {
        this.translate = new GoogleTranslate.Translate({
            credentials: {
                // e.g. same service account credentials
                type: 'service_account',
                private_key:
                    '-----BEGIN PRIVATE KEY-----\n...-----END PRIVATE KEY-----\n',
                client_email:
                    'doty-108@steady-mason-393109.iam.gserviceaccount.com',
                client_id: '113733083163309833489',
                token_url: 'https://oauth2.googleapis.com/token',
            },
        });
    }

    public async translateText(input: string[], language: string) {
        const [translations] = await this.translate.translate(input, language);
        return translations;
    }

    public translateVod(dto: TranslateVodDto) {
        return new Promise((resolve, reject) => {
            this.translate
                .translate(dto.contents, dto.language)
                .then((res) => {
                    // res => [translatedStrings, { data: { translations: ... } }]
                    const translationsObject = res[1];
                    try {
                        const translations =
                            translationsObject.data.translations;
                        resolve(translations);
                    } catch (error) {
                        // fallback
                        resolve(
                            dto.contents.map((content) => ({
                                translatedText: content,
                                detectedSourceLanguage: dto.language,
                            }))
                        );
                    }
                })
                .catch((err) => {
                    // replace BadRequestException with normal Error or custom
                    reject(new Error('Language must be iso639 value: ' + err));
                });
        });
    }
}
