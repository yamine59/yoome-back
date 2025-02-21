module.exports = getDateWithDay = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());    

    return `${year}-${month}-${day}`;
};