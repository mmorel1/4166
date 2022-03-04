const {ObjectId} = require('mongodb');

//need a reference to the stories collection in mongodb
let stories;
exports.getCollection = db=>{
    stories = db.collection('stories');
}
exports.find = () => stories.find().toArray();

exports.findById = id => stories.findOne({_id: ObjectId(id)});

exports.save = story => stories.insertOne(story);

exports.updateById = (id, newStory) => stories.updateOne({_id: ObjectId(id)}, 
{$set: {title: newStory.title, content: newStory.content}});

exports.deleteById = id => stories.deleteOne({_id: ObjectId(id)});


// exports.deleteById = function(id) {
//     let index = stories.findIndex(story =>story.id === id);
//     if(index !== -1) {
//         stories.splice(index, 1);
//         return true;
//     } else {
//         return false;
//     }
// }