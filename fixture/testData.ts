export const testData = {
    ADMIN_CREDENTIALS: { username: 'rajesh', password: 'Test@123' },
    KOT_CREDENTIALS: { username: 'kotcsf', password: 'Kotcsf1' },
    KOT_CREDENTIALS1: { username: 'kotsouth1', password: 'Kotsouth1' },
    KOT_CREDENTIALS2: { username: 'paramu', password: 'Paramu1' },
    SERVER_CREDENTIALS: { username: 'mani1', password: 'Mani1' },
    RESTAURANT_ID: 'x713fo2tx5',
    RESTAURANT_NAME: 'Madurai Veedu',

    get USER_URL() {
        return `http://uatguestuser.cocaptain.co.in/#/qr-login/${this.RESTAURANT_ID}/`;
    },
    get ADMIN_URL() {
        return `http://uatemployee.cocaptain.co.in/#/login/${this.RESTAURANT_ID}`;
    },
    get KOT_URL() {
        return `http://uatemployee.cocaptain.co.in/#/login/${this.RESTAURANT_ID}`;
    },

    get SERVER_URL() {
        return `http://uatemployee.cocaptain.co.in/#/login/${this.RESTAURANT_ID}`;
    },

    APPROVE_LIST_URL: 'http://uatemployee.cocaptain.co.in/#/home/tabs/approve-list',
    ORDER_LIST_URL: 'http://uatemployee.cocaptain.co.in/#/home/tabs/order-list-kot',
    SERVER_LIST_URL: 'http://uatemployee.cocaptain.co.in/#/home/tabs/order-list-server',
};