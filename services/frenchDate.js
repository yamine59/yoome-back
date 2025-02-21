module.exports = getMySQLDateTime = () => {
    const date = new Date();
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1); 
    const day = String(date.getDate());
    const hour = String(date.getHours());
    const minute = String(date.getMinutes());
    const second = String(date.getSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};


