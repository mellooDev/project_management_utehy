import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {of} from "rxjs";
import {HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  // private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

}
