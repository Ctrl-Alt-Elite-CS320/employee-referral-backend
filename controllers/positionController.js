exports.all_get = async (req, res) => {
    res.send('not implemented: list of positions');
};

exports.all_filtered_get = async (req, res) => {
    res.send('not implemented: list of positions w/ filters');
};

exports.detail_get = async (req, res) => {
    res.send('not implemented: details of position w/ given id:' + req.params.id);
};

exports.applications_all_get = async (req, res) => {
    res.send('not implemented: show applications for position w/ given id:' + req.params.id);
};

exports.application_detail_get = async (req, res) => {
    res.send('not implemented: show application with id:' + req.params.appId + ' for position w/ given id:' + req.params.id);
};

exports.new_get = async (req, res) => {
    res.send('not implemented: get form to create new position');
};

exports.new_post = async (req, res) => {
    res.send('not implemented: post new position');
};

exports.new_application_get = async (req, res) => {
    res.send('not implemented: get form for new application for position w/ given id:' + req.params.id);
};

exports.new_application_post = async (req, res) => {
    res.send('not implemented: post new application for position w/ given id:' + req.params.id);
};

exports.delete_get = async (req, res) => {
    res.send('not implemented: get congirmation for deleting position w/ given id:' + req.params.id);
};

exports.application_delete_get = async (req, res) => {
    res.send('not implemented: get confirmation page or deleting application with id:' + req.params.appId + ' for position w/ given id:' + req.params.id);
};
