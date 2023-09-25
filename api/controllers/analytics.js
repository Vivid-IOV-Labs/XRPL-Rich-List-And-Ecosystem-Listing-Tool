const Mixpanel = require('mixpanel');
const { v4: uuidv4 } = require('uuid');

const analytics = async (eventName) => {
    try {
        const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
        const randomUUID = uuidv4();

        mixpanel.track(eventName, {
            distinct_id: randomUUID,
            timestamp: new Date().toISOString()
        });

        return;
    } catch (error) {
        console.log(error);
    }
};

module.exports = analytics;