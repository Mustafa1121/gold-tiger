const createSocialLinks = (facebook, instagram, twitter, linkedIn, youtube) => {
  return {
    ...(facebook && { facebook }),
    ...(instagram && { instagram }),
    ...(twitter && { twitter }),
    ...(linkedIn && { linkedIn }),
    ...(youtube && { youtube }),
  };
};


module.exports = {
    createSocialLinks
}