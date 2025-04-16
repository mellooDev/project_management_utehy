import {environment} from "../../environments/environment";

export class AppConstants {
  public static API_ORDER_BASE_URL = environment.billing;
  public static API_PAYMENT_BASE_URL = environment.payment;
  public static API_BASE_URL = environment.apiBaseUrl;
  public static API_NOTIFY_URL = environment.notify;
  public static API_PRODUCT_BASE_URL = environment.dataCatalog + "/";
  public static API_DATABASE_BASE_URL = environment.dataManagement + "/" ;
  public static API_CATALOG_BASE_URL = environment.dataCatalog;
  public static GATEWAY_API = environment.apiBaseUrl;
  public static API_AUTHEN_URL=environment.authen;


  private static OAUTH2_URL = environment.apiBaseUrlOauth + "oauth2/authorization/";
  private static REDIRECT_URL = "?redirect_uri=" + environment.redirectFeUrl;
  public static API_URL = environment.authen + "/api/";
  public static AUTH_API = AppConstants.API_URL + "auth/";
  public static GOOGLE_AUTH_URL = AppConstants.OAUTH2_URL + "google" + AppConstants.REDIRECT_URL;
  public static FACEBOOK_AUTH_URL = AppConstants.OAUTH2_URL + "facebook" + AppConstants.REDIRECT_URL;
  public static GITHUB_AUTH_URL = AppConstants.OAUTH2_URL + "github" + AppConstants.REDIRECT_URL;
  public static LINKEDIN_AUTH_URL = AppConstants.OAUTH2_URL + "linkedin" + AppConstants.REDIRECT_URL;
}
