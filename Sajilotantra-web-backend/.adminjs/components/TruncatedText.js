// import React from 'react';

// const TruncatedField = (props) => {
//     const { record, property } = props;
//     const value = record?.params[property.name];

//     if (!value) return null;

//     const words = value.split(' ');
//     const truncatedText = words.length > 10 ? `${words.slice(0, 10).join(' ')}...` : value;

//     return <span>{truncatedText}</span>;
// };

// export default TruncatedField;


const TruncateDescription = ({ record }) => {
    const description = record?.params?.description || '';
    const truncated = description.split(' ').slice(0, 10).join(' ') + '...';
    return { text: truncated };
};

export default TruncateDescription;
