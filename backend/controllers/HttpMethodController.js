const droneConfigServer = async () => {
    const response = await fetch('https://script.googleusercontent.com/a/macros/kmitl.ac.th/echo?user_content_key=rkqt64F98HmsGGjX2omaeGSbyw13_YduQeSaGEF0lB7bHzbANljxz4jX2CjwchWaJrCKMbK5LgUTYZydYY5kU4T6vCJmz6mFOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKDKZjKBq1Xc9sWoyaHaoG5vh0lmODcuY_2rPTzpFsAmwnwBhSVRI2rMiUit7buCxwbDz0ZDYFmx5Dfj1A6aFLizxS6unfEF1TdEuLOvZLaRR0R2bQ-0Q7TZ97gfP5tp1cY&lib=M9_yccKOaZVEQaYjEvK1gClQlFAuFWsxN');
    const dummyDb = await response.json(); 
    return dummyDb;
}

const droneLogServer = async () => {
    const response = await fetch(`https://app-tracking.pockethost.io/api/collections/drone_logs/records`);
    const dummyDb = await response.json();
    return dummyDb;
}

exports.getAllConfigs = async (req,res) => {
    try {
        const dummyDb = await droneConfigServer();
        let result = [];

        dummyDb.data.forEach(drone => {
            let max_speed;
            if (!drone.max_speed || drone.max_speed === '') {
                max_speed = 100;
            } else if (drone.max_speed && drone.max_speed > 110) {
                max_speed = 110;
            } else {
                max_speed = drone.max_speed;
            }

            result.push({
                drone_id: drone.drone_id,
                drone_name: drone.drone_name,
                light: drone.light,
                country: drone.country,
                max_speed: max_speed,
                // condition: drone.condition
                population: drone.population
            });
        });

        if (result.length > 0) {
            return res.status(200).json({
                status: 'success',
                data: result
            });
        } else {
            return res.status(404).json({
                status: 'failed',
                message: 'No drones found'
            });
        }


    } catch (error) {
        return res.status(500).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.getConfigs = async (req,res) => {
    try {
        const dummyDb = await droneConfigServer();
        const droneData = dummyDb.data.find(drone => drone.drone_id == req.params.id);
        
        if(droneData){
            let max_speed;
            if(!droneData.max_speed || droneData.max_speed == '') {
                max_speed = 100;
            }else if(droneData.max_speed && droneData.max_speed > 110) {
                max_speed = 110;
            }else {
                max_speed = droneData.max_speed;
            }

            const data = {
                drone_id: droneData.drone_id,
                drone_name: droneData.drone_name,
                light: droneData.light,
                country: droneData.country,
                max_speed: max_speed,
            }

            return res.status(200).json({
                status: 'success',
                data: data
            })        
        }else{
            return res.status(404).json({
                status: 'failed',
                message: 'Drone not found'
            })
        }

    } catch (error) {
        return res.status(500).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.getStatus = async (req,res) => {
    try {
        const dummyDb = await droneConfigServer();
        const droneData = dummyDb.data.find(drone => drone.drone_id == req.params.id);
        
        if(droneData){
            const data = {
                condition: droneData.condition,
            }

            return res.status(200).json({
                status: 'success',
                data: data
            })        
        }else{
            return res.status(404).json({
                status: 'failed',
                message: 'Drone not found'
            })
        }

    } catch (error) {
        return res.status(500).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.getLogs = async (req,res) => {
    try {

        const dummyDb = await droneLogServer();

        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(dummyDb.perPage);
        const totalPages = parseInt(dummyDb.totalPages);

        let allLogs = [];
        // const logs = dummyDb.items.map( async (log) => {
        for(let i = 1; i <= totalPages; i++) {
            const response = await fetch(`https://app-tracking.pockethost.io/api/collections/drone_logs/records?page=${i}`);
            const dataResponse = await response.json();

            const logs = dataResponse.items.map(log => {
                // if(log.drone_id <= 100){
                        const data = {
                            drone_id: log.drone_id,
                            drone_name: log.drone_name,
                            light: log.light,
                            country: log.country,
                            celsius: log.celsius,
                            created: log.created,
                        }
                        return data;
                // }
                // return null;
            })            
            allLogs = allLogs.concat(logs);        
        }
        // .filter(data => data !== null)
        allLogs.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedLogs = allLogs.slice(startIndex, endIndex);

        if(paginatedLogs.length > 0) {
            return res.status(200).json({
                status:'success',
                currentPage: page,
                totalPages: dummyDb.totalPages,
                count: paginatedLogs.length,
                data: paginatedLogs,
            })
        }

        return res.status(200).json({
            status: 'success',
            data: 'No data',
        })

    } catch (error) {
        return res.status(500).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.postLogs = async (req, res) => {
    try {
        const logData = req.body;

        const response = await fetch('https://app-tracking.pockethost.io/api/collections/drone_logs/records', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logData) 
        });

        const postLog = await response.json();

        if (response.ok) {
            return res.status(200).json({
                status: 'success',
                data: postLog
            });
        } else {
            return res.status(response.status).json({
                status: 'failed',
                message: postLog.message || 'Failed to create log'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'failed',
            message: error.message
        });
    }
}