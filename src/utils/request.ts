import axios, { AxiosDefaults, AxiosInstance, CreateAxiosDefaults, HeadersDefaults } from 'axios';
/**
 * 请求的基类
 */
class RequestBase {
    config: CreateAxiosDefaults<any>;
    constructor(config: CreateAxiosDefaults<any>) {
        this.config = config;
    }
}
/**
 * 使用XHR的方式进行请求
 */
class XHRRequest extends RequestBase {
    instance: AxiosInstance;
    token: string = '';
    constructor(config: CreateAxiosDefaults<any>) {
        super(config);
        this.instance = axios.create(config);
        this.instance.interceptors.request.use(
            (config: any) => {
                return config;
            },
            (error: any) => {
                return Promise.reject(error);
            },
        );
        this.instance.interceptors.response.use(
            // success
            function (response: any) {
                return response;
            },
            // error
            function (error: any) {
                return Promise.reject(error);
            },
        );
    }
}
/**
 * 使用fetch的方式进行请求
 */
class FetchRequest extends XHRRequest {
    // instance: AxiosInstance;
    constructor(config: CreateAxiosDefaults<any>) {
        // ?此处有问题，暂不支持 在axios基础上增加fetch的适配器
        // const adpConfig = { ...config, adapter: adapter };
        // super(adpConfig);
        super(config);
    }
}
type APIResultType={
    errcode: number,
    errmsg: string
    [rest: string ]: any
}
/**
 * fetch 和 XHR的适配层
 */
export class Request {
    private _request: XHRRequest | FetchRequest;
    private _config: CreateAxiosDefaults<any>;
    constructor(config: CreateAxiosDefaults<any>, use: 'XHR' | 'Fetch' = 'XHR') {
        this._config = config;
        switch (use) {
            case 'Fetch':
                this._request = new FetchRequest(config);
                break;
            case 'XHR':
            default:
                this._request = new XHRRequest(config);
                break;
        }
    }
    get instance() {
        return this._request.instance;
    }
    set config(
        config: Omit<AxiosDefaults<any>, 'headers'> & {
            headers: HeadersDefaults & {
                [key: string]: any;
            };
        },
    ) {
        this._config = config;
        this._request.instance.defaults.baseURL = config.baseURL;
        this._request.instance.defaults.timeout = config.timeout;
        // const token = config.headers['Authorization'];
        // this._request.token = token;
        // Store.set('token', token);
        // this._request.instance.defaults.headers['Authorization'] = token;
    }
    get = async (url: string, params?: object) => {
        return this.instance.get<APIResultType>(url, { params });
    };
    post = async (url: string, data?: object) => {
        return this.instance.post<APIResultType>(url, data);
    };
    resetRequest = (use: 'XHR' | 'Fetch') => {
        switch (use) {
            case 'Fetch':
                this._request = new FetchRequest(this._config);
                break;
            case 'XHR':
            default:
                this._request = new XHRRequest(this._config);
                break;
        }
    };
}
export default new Request({});
