export const findOne = async ({ model, filter = {}, select = "", options = {} } = {}) => {
    const doc = model.findOne(filter);
    if (select) doc.select(select);
    if (options?.populate) doc.populate(options.populate);
    if (options?.lean) doc.lean();

    return await doc.exec();
};
export const findByID = async ({ model, id, select = "", options = {} } = {}) => {
    const doc = model.findById(id);
    if (select) doc.select(select);
    if (options?.populate) doc.populate(options.populate);
    if (options?.lean) doc.lean();

    return await doc.exec();
};


export const find = async ({ model, filter = {}, select = "", options = {} } = {}) => {
    const doc = model.find(filter);
    if (select) doc.select(select);
    if (options?.populate) doc.populate(options.populate);
    if (options?.lean) doc.lean();
    if (options?.sort) doc.sort(options.sort);
    if (options?.limit) doc.limit(options.limit);
    if (options?.skip) doc.skip(options.skip);

    return await doc.exec();
};


export const create = async ({ model, data = [], options = { validateBeforeSave: true } } = {}) => {
 const doc = new model(data);
  return await doc.save();
};

export const insertMany = async ({ model, data = [], options = { validateBeforeSave: true } } = {}) => {
  const docs = await model.insertMany(data, options);
  return docs;
};

export const updateOne = async ({ model, filter = {}, update = {}, options = {} } = {}) => {
  const doc = model.updateOne(filter, {...update, $inc: { __v: 1 } }, options);
  return await doc.exec();
};

export const updateMany = async ({ model, filter = {}, update = {}, options = {} } = {}) => {
  const docs = await model.updateMany(filter, {...update, $inc: { __v: 1 } }, options);
  return docs;
};

export const findOneAndUpdate = async ({ model, filter = {}, update , options = {} } = {}) => {
  const doc = model.findOneAndUpdate(filter, {...update, $inc: { __v: 1 } }, 
    {...options, returnDocument: 'after', runValidators: true});
  return await doc.exec();
};

export const findByIDAndUpdate = async ({ model, id, update, options = {} } = {}) => {
  const doc = model.findByIdAndUpdate(id, {...update, $inc: { __v: 1 } }, 
    {...options, returnDocument: 'after', runValidators: true});
  return await doc.exec();
};

export const deleteOne = async ({ model, filter = {} } = {}) => {
  const doc = model.deleteOne(filter);
  return await doc.exec();
};

export const deleteMany = async ({ model, filter = {} } = {}) => {
  const docs = await model.deleteMany(filter);
  return docs;
};

export const findByIDAndDelete = async ({ model, id } = {}) => {
  const doc = model.findByIdAndDelete(id);
  return await doc.exec();
};

export const findOneAndDelete = async ({ model, filter = {} } = {}) => {
  const doc = model.findOneAndDelete(filter);
  return await doc.exec();
};


