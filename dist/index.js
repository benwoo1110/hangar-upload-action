"use strict";
import core from "@actions/core";
import FormData from "form-data";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
const apiToken = core.getInput("api_token", { required: true });
const slug = core.getInput("slug", { required: true });
const version = core.getInput("version", { required: true });
const channel = core.getInput("channel", { required: true });
const files = core.getInput("files", { required: true });
const description = core.getInput("description");
const pluginDependencies = core.getInput("plugin_dependencies");
const platformDependencies = core.getInput("platform_dependencies");
main().catch((err) => {
  console.error(err);
  core.setFailed(err.message);
});
async function main() {
  const form = new FormData();
  const filesArray = JSON.parse(files);
  const filesData = [];
  for (const file of filesArray) {
    if (file.path) {
      form.append("files", fs.createReadStream(file.path), { contentType: "application/x-binary", filename: path.basename(file.path) });
      filesData.push({ platforms: file.platforms });
    } else if (file.url && file.externalUrl) {
      filesData.push({ platforms: file.platforms, url: true, externalUrl: file.externalUrl });
    } else {
      core.setFailed(`Invalid file data: ${JSON.stringify(file)}`);
      process.exit(1);
    }
  }
  const versionUpload = {
    version,
    channel,
    description,
    files: filesData,
    pluginDependencies: JSON.parse(pluginDependencies),
    platformDependencies: JSON.parse(platformDependencies)
  };
  core.info(JSON.stringify(versionUpload));
  form.append("versionUpload", JSON.stringify(versionUpload), { contentType: "application/json" });
  const token = await fetch(`https://hangar.papermc.io/api/v1/authenticate?apiKey=${apiToken}`, {
    method: "POST",
    headers: {
      "User-Agent": `hangar-upload-action; ${slug};`
    }
  }).then(async (res) => {
    if (!res.ok) {
      core.setFailed(`Failed to authenticate: ${res.statusText} ${await res.text()}`);
      process.exit(1);
    }
    return await res.json();
  }).then((data) => data.token);
  core.info("Successfully authenticated!");
  const resp = await fetch(`https://hangar.papermc.io/api/v1/projects/${slug}/upload`, {
    method: "POST",
    headers: {
      "User-Agent": `hangar-upload-action; ${slug};`,
      "Authorization": token,
      ...form.getHeaders()
    },
    body: form
  }).then(async (res) => {
    if (!res.ok) {
      core.setFailed(`Failed to upload: ${res.statusText} ${await res.text()}`);
      process.exit(1);
    }
    return await res.json();
  });
  core.info(JSON.stringify(resp));
}
