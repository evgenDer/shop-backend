export const getItemById = async (collection, itemId) => {
  return collection.find(({ id }) => itemId === id);
};
