import axios from 'axios';

export const testFunction = async () => {
    try {
        const res = await axios.get('/api/user');
        console.log(res);
        return res;
    }
    catch (e) {
        return {
            status: false, message: e.message
        };
    }
}