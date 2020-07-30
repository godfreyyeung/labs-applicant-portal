import { 
  Injectable, 
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { ConfigService } from '../config/config.service';
import { ContactService } from '../contact/contact.service';

/**
 * This service is responsible for verifying NYCID tokens presented
 * by the user and generating new ZAP token for the user.
 *
 * @class      AuthService (name)
 */
@Injectable()
export class AuthService {
  // required env variables
  NYCID_TOKEN_SECRET = '';
  ZAP_TOKEN_SECRET = '';

  // development environment features
  CRM_IMPOSTER_ID = '';

  constructor(
    private readonly config: ConfigService,
    private readonly contactService: ContactService,
  ) {
    this.NYCID_TOKEN_SECRET = this.config.get('NYCID_TOKEN_SECRET');
    this.CRM_IMPOSTER_ID = this.config.get('CRM_IMPOSTER_ID');
    this.ZAP_TOKEN_SECRET = this.config.get('ZAP_TOKEN_SECRET');
  }

  /**
   * Generates a new app token, using NYC.ID's expiration, and including the CRM contact id
   *
   * @param      {string}  contactId  The CRM contactid
   * @param      {string}  exp        A string coercable to a Date
   * @param      {object}  exp        Metadata about the nyc ID user
   * @return     {string}             String representing ZAP token
   */
  private signNewToken(
    contactId: string,
    nycIdAccount: any = {},
  ): string {
    const { ZAP_TOKEN_SECRET } = this;
    const {
      nycExtTOUVersion,
      mail,
      scope,
      nycExtEmailValidationFlag,
      GUID,
      userType,
      exp,
      jti,
    } = nycIdAccount;

    return jwt.sign({
      // JWT standard name for expiration - see https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim
      exp,

      // CRM id — added to this app's JWT for later queries
      contactId,

      // additional NYC.ID account information
      nycExtTOUVersion,
      mail,
      scope,
      nycExtEmailValidationFlag,
      GUID,
      userType,
      jti,
    }, ZAP_TOKEN_SECRET);
  }

  private verifyToken(token, secret): string | {} {
    try {
      return jwt.verify(token, secret);
    } catch (e) {
      throw new HttpException(`Could not verify token. ${e}`, HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Verifies a JWT with the NYCID signature. Returns the token object.
   *
   * @param      {string}  token   The token
   * @return     {object}     { mail: 'string', exp: 'string' }
   */
  private verifyNYCIDToken(token): any {
    const { NYCID_TOKEN_SECRET } = this;

    try {
      return this.verifyToken(token, NYCID_TOKEN_SECRET);
    } catch (e) {
      throw new BadRequestException(`Could not verify NYCID Token: ${e}`);
    }
  }


  /**
   * This function extracts the email from an NYCIDToken and uses it to
   * look up a Contact in CRM. It returns to the client a ZAP token holding
   * (signed with) the acquired Contact's contactid. 
   * 
   * It also allows for looking up a contact by CRM_IMPOSTER_ID, if the
   * environment variable exists, and SKIP_AUTH is true.
   * 
   * @param      {string}  NYCIDToken  Token from NYCID
   * @return     {string}              String representing generated ZAP Token
   */
  public async generateNewToken(NYCIDToken: string): Promise<string> {
    const nycIdAccount = this.verifyNYCIDToken(NYCIDToken);

    // need the email to lookup a CRM contact.
    const { mail } = nycIdAccount;
    const { CRM_IMPOSTER_ID } = this;

    let contact = null;

    // prefer finding contact by CRM_IMPOSTER_ID, if it exists
    if (CRM_IMPOSTER_ID) {
      contact = await this.contactService.findOneById(CRM_IMPOSTER_ID)
    } else {
      contact = await this.contactService.findOneByEmail(mail);
    };

    if (!contact) {
      const responseBody = {
        "code": "NO_CONTACT_FOUND",
        "message": `CRM Contact not found for given email or ID: ${mail}`,
      }

      throw new HttpException(responseBody, HttpStatus.UNAUTHORIZED);
    }

    return this.signNewToken(contact.contactid, nycIdAccount);
  }

  /**
   * Validates the current signed JWT generated by ZAP API.
   *
   * @param      {string}  token   The token
   */
  public validateCurrentToken(token: string) {
    try {
      return this.verifyCRMToken(token);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  /**
   * Verifies a JWT with the CRM signing secret. Returns a token object.
   *
   * @param      {string}  token   The token
   * @return     {any}     { mail: 'string', exp: 'string' }
   */
  private verifyCRMToken(token): any {
    const { ZAP_TOKEN_SECRET } = this;

    try {
      return this.verifyToken(token, ZAP_TOKEN_SECRET);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
