export default function destroyOpentokObject(otObject, callback) {
  if (otObject && (otObject instanceof OT.Publisher || otObject instanceof OT.Subscriber)) {
    otObject.off();
    otObject.on('destroyed', callback);
    otObject.destroy();
  } else if (otObject && (otObject instanceof OT.Session)) {
    otObject.off();
    otObject.on('sessionDisconnected', () => {
      otObject.off();
      callback();
    });
    otObject.disconnect();
  } else {
    callback();
  }
}
