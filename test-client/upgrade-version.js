const { set  } = require("edit-package-json");
const { version } = require("package");
const newVersion = version + 1;
set(source, "version", newVersion);
